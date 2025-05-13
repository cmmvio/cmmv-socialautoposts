<p align="center">
  <a href="https://cmmv.io/" target="blank"><img src="https://raw.githubusercontent.com/cmmvio/docs.cmmv.io/main/public/assets/logo_CMMV2_icon.png" width="300" alt="CMMV Logo" /></a>
</p>
<p align="center">CMMV Social AutoPosts <br/> An advanced social media automation platform for managing and scheduling content across multiple networks.</p>
<p align="center">
    <a href="https://github.com/cmmvio/cmmv-socialautoposts/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@cmmv/socialautoposts.svg" alt="Package License" /></a>
</p>

<p align="center">
  <a href="https://cmmv.io/docs">Documentation</a> &bull;
  <a href="https://github.com/cmmvio/cmmv-socialautoposts/issues">Report Issue</a>
</p>

## Description

CMMV Social AutoPosts is a comprehensive social media automation platform designed to streamline content publishing across multiple social platforms. It provides an intuitive interface for connecting social accounts, managing content feeds, scheduling posts, and tracking engagement metrics all in one place.

Built on the CMMV (Contract-Model-Model-View) architecture, this platform leverages contract-based development to automate API communication, content scheduling, and multi-platform publishing. The system supports OAuth integration with popular social networks, URL shortening with analytics, and a flexible queue system for content management.

## Features

- **Multi-Platform Integration:** Connect and post to Facebook, Twitter/X, Instagram, LinkedIn, and more
- **Feed Management:** Automatically collect and publish content from RSS feeds
- **Post Queue:** Manage scheduled posts with custom publishing times
- **URL Shortening:** Create branded short links with click tracking and analytics
- **Publishing Options:** Post immediately, schedule for later, or approve manually
- **Performance Analytics:** Track engagement metrics across posts and platforms
- **Social Account Management:** Securely manage multiple social media accounts
- **Dashboard:** Centralized view of key metrics and performance indicators

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- PNPM package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/cmmvio/cmmv-socialautoposts.git

# Navigate to the project directory
cd cmmv-socialautoposts

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env file with your settings

# Start the development server
pnpm dev
```

## Core Components

### Social Media Integration

CMMV Social AutoPosts supports OAuth-based integration with multiple social platforms:

- **Facebook:** Post to pages and profiles
- **Twitter/X:** Share tweets with media support
- **Instagram:** Connect business accounts for posting
- **LinkedIn:** Publish to personal profiles and company pages
- **Reddit:** Submit to subreddits
- **Other platforms:** Extensible system for additional networks

### Feed Management

The platform allows you to connect and manage content sources:

- **RSS Feeds:** Automatically ingest content from any RSS/Atom feed
- **Content Filtering:** Set rules to include or exclude content
- **Publishing Rules:** Configure how and when content is shared
- **Social Platform Selection:** Choose which platforms receive content from each feed

### Queue Management

A flexible queue system for scheduling and managing posts:

- **Scheduling:** Set custom publishing times for optimal engagement
- **Post Preview:** See how content will appear on each platform
- **Bulk Operations:** Schedule, edit, or delete multiple posts at once
- **Status Tracking:** Monitor whether posts have been published or are pending

### URL Shortener

Built-in URL shortening service with tracking capabilities:

- **Custom Domains:** Use your own domain for branded short links
- **Click Analytics:** Track clicks, referrers, and geographical data
- **Link Management:** Create, edit, and organize shortened URLs
- **Automatic Shortening:** Optionally shorten URLs in all posts

### Analytics Dashboard

Comprehensive reporting on post performance:

- **Engagement Metrics:** Track clicks, views, shares, and comments
- **Platform Comparison:** Compare performance across different networks
- **Time-based Analysis:** View trends over time
- **Top Content:** Identify your most successful posts

## API Reference

The platform provides a comprehensive API for integration with other systems:

### Authentication
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/logout`: End current session
- `GET /api/auth/check`: Verify authentication status

### Feeds
- `GET /api/feeds`: Get all feeds
- `POST /api/feeds`: Create a new feed
- `PUT /api/feeds/:id`: Update a feed
- `DELETE /api/feeds/:id`: Delete a feed

### Queue
- `GET /api/queue`: Get queued items
- `PUT /api/feed-items/:id/status`: Update item status
- `GET /api/feed-items/:id`: Get details for a queue item

### Short Links
- `GET /api/shortlinks`: Get all short links
- `POST /api/shortlinks`: Create a new short link
- `PUT /api/shortlinks/:id`: Update a short link

### Social Integrations
- `GET /api/integrations`: Get connected social accounts
- `POST /api/integration/:platform/connect`: Connect a social account
- `DELETE /api/integrations/:id`: Remove a social account

## Configuration

Configure the application by editing the environment variables:

```
# API Settings
PORT=7000
FRONTEND_URL="http://localhost:7002/api"

FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""

INSTAGRAM_APP_ID=""
INSTAGRAM_APP_SECRET=""

TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
```