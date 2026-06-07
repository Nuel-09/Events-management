import { Controller, Post, Body, Put, Param, Delete, Get, Query, UseGuards, Res } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an event (Creators only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully.' })
  @ApiResponse({ status: 403, description: 'Only creators can create events.' })
  async create(@Body() createEventDto: CreateEventDto, @CurrentUser('id') creatorId: string) {
    return this.eventService.create(creatorId, createEventDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event details (Creator owner only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async update(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser('id') creatorId: string,
  ) {
    return this.eventService.update(eventId, creatorId, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (Creator owner only)' })
  @ApiResponse({ status: 200, description: 'Event removed successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async remove(@Param('id') eventId: string, @CurrentUser('id') creatorId: string) {
    return this.eventService.remove(eventId, creatorId);
  }

  @Get('creator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all events created by logged-in creator, along with booked attendees' })
  @ApiResponse({ status: 200, description: 'List of events with applicants.' })
  async getCreatorEvents(@CurrentUser('id') creatorId: string) {
    return this.eventService.getCreatorEvents(creatorId);
  }

  @Get()
  @ApiOperation({ summary: 'List all events with cursor pagination and search filter (public)' })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword to search in title, description, or location' })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 10 }, description: 'Number of items per page' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor event ID for pagination' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved list of events.' })
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    const limitVal = limit ? Number(limit) : 10;
    return this.eventService.findAll(search, limitVal, cursor);
  }

  @Get(':id/share')
  @ApiOperation({ summary: 'Public route returning dynamic OpenGraph HTML tags for sharing' })
  @ApiResponse({ status: 200, description: 'Returns raw HTML page containing metadata preview tags.' })
  async shareEvent(@Param('id') eventId: string, @Res() res: Response) {
    const event = (await this.eventService.findOne(eventId)) as any;
    
    const formattedDate = event.date instanceof Date ? event.date.toUTCString() : new Date(event.date).toUTCString();
    
    const ogHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${event.title} | Eventful</title>
  <meta name="description" content="${event.description}" />
  
  <!-- OpenGraph Metadata -->
  <meta property="og:title" content="${event.title}" />
  <meta property="og:description" content="${event.description}" />
  <meta property="og:image" content="https://picsum.photos/800/400?random=${event.id}" />
  <meta property="og:type" content="event" />
  <meta property="og:site_name" content="Eventful" />
  <meta property="og:url" content="https://eventful.com/events/${event.id}" />
  
  <!-- Twitter Card Metadata -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${event.title}">
  <meta name="twitter:description" content="${event.description}">
  <meta name="twitter:image" content="https://picsum.photos/800/400?random=${event.id}">

  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #121214;
      color: #e1e1e6;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #202024;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      max-width: 500px;
      text-align: center;
    }
    h1 { color: #04d361; margin-bottom: 1rem; }
    p { line-height: 1.6; margin: 0.5rem 0; }
    .btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.8rem 1.8rem;
      background: #04d361;
      color: #fff;
      text-decoration: none;
      font-weight: bold;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn:hover { background: #03a84e; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${event.title}</h1>
    <p><strong>Description:</strong> ${event.description}</p>
    <p><strong>Venue:</strong> ${event.location}</p>
    <p><strong>Date & Time:</strong> ${formattedDate}</p>
    <p><strong>Ticket Price:</strong> $${event.price}</p>
    <a href="/events/${event.id}" class="btn">View on Eventful</a>
  </div>
  
  <script>
    // Redirect normal browsers to actual frontend listing after a slight delay
    setTimeout(() => {
      window.location.href = '/events/${event.id}';
    }, 1500);
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(ogHtml);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details of a single event (public)' })
  @ApiResponse({ status: 200, description: 'Event details.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async findOne(@Param('id') eventId: string) {
    return this.eventService.findOne(eventId);
  }
}
