import { Controller, Post, Body, Get, Param, UseGuards, Req, Headers, RawBodyRequest, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EVENTEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book a ticket and initialize a Paystack payment session (Eventees only)' })
  @ApiResponse({ status: 201, description: 'Payment initialized or ticket booked (if free).' })
  @ApiResponse({ status: 400, description: 'Sold out event or other initialization errors.' })
  async initializePayment(
    @Body() dto: InitializePaymentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
  ) {
    return this.paymentService.initializePayment(userId, email, dto);
  }

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually verify transaction status via Paystack API' })
  @ApiResponse({ status: 200, description: 'Verification results (completes ticket fulfillment on success).' })
  async verifyPayment(
    @Param('reference') reference: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentService.verifyAndFulfillByReference(reference, userId);
  }

  @Get('creator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve payment histories across all events created by logged-in creator' })
  @ApiResponse({ status: 200, description: 'Detailed payment receipts.' })
  async getCreatorPayments(@CurrentUser('id') creatorId: string) {
    return this.paymentService.getCreatorPaymentDetails(creatorId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook receiver to verify signatures and record successful charges' })
  @ApiResponse({ status: 200, description: 'Webhook acknowledged.' })
  async handleWebhook(
    @Req() req: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : '';
    return this.paymentService.verifyPaystackWebhook(rawBody, signature);
  }

  @Post('reconcile-pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Development only — verify all PENDING tickets with Paystack and fulfill successful payments',
  })
  reconcilePending() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Not available in production');
    }
    return this.paymentService.reconcilePendingPayments();
  }
}
