# Portal System for Snake Game

## Overview
The portal system adds teleportation mechanics to the snake game, allowing the snake to instantly travel between two linked portals.

## Features

### Portal Class (`Portal.ts`)
- **Visual Design**: Purple outer ring with red inner ring, continuously rotating
- **Teleportation State**: Tracks when a snake is teleporting through the portal
- **Visual Effects**: Green pulsing ring during teleportation
- **Activation States**: Portals can be active/inactive to prevent premature spawning

### Portal Manager (`PortalManager.ts`)
- **Smart Spawning**: Portals only appear after score reaches 10
- **Collision Prevention**: Portals won't spawn on snake, food, or other portals
- **Teleportation Timing**: Duration scales with snake length (1.5s base + 150ms per segment)
- **State Management**: Prevents new portal spawning during teleportation

## How It Works

1. **Portal Spawning**: Every 5 seconds, two linked portals spawn at random positions
2. **Teleportation Trigger**: When snake head touches a portal, teleportation begins
3. **Portal Deactivation**: Both portals become semi-transparent and stop rotating
4. **Snake Movement**: Entire snake (head + body) moves to target portal position
5. **Portal Reactivation**: After teleportation completes, portals become active again

## Key Improvements for Long Snakes

- **Extended Duration**: Teleportation time scales with snake length
- **Complete Movement**: All body segments move together to prevent cutting
- **Visual Feedback**: Green pulsing effect shows teleportation in progress
- **State Protection**: Prevents multiple teleportations during active teleportation

## Configuration

- **Minimum Score**: 10 (portals only appear after this score)
- **Spawn Interval**: 5 seconds
- **Base Teleport Duration**: 4.5 seconds
- **Duration per Segment**: 150ms per snake body segment

## Usage

The portal system is automatically integrated into the game. No additional setup required. 