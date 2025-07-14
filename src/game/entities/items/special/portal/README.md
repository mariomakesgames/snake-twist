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
- **Dynamic Generation**: Intelligent spawning based on game progress and player behavior

## How It Works

1. **Portal Spawning**: Every 15 seconds, two linked portals spawn at random positions (reduced frequency)
2. **Minimum Lifetime**: Portals must exist for at least 10 seconds before being replaced
3. **Dynamic Probability**: Spawn chance decreases with higher scores and longer snakes
4. **Consecutive Teleportation Limit**: Maximum 3 consecutive teleportations before cooldown
5. **Teleportation Trigger**: When snake head touches a portal, teleportation begins
6. **Portal Deactivation**: Both portals become semi-transparent and stop rotating
7. **Snake Movement**: Entire snake (head + body) moves to target portal position
8. **Portal Reactivation**: After teleportation completes, portals become active again

## Key Improvements for Reduced Frequency

- **Extended Spawn Interval**: Increased from 5 to 15 seconds
- **Minimum Lifetime**: Portals must exist for at least 10 seconds
- **Dynamic Spawn Probability**: Based on score, snake length, and teleportation history
- **Consecutive Teleportation Tracking**: Prevents excessive portal usage
- **Smart Cooldown**: Automatic cooldown after multiple rapid teleportations

## Configuration

- **Minimum Score**: 10 (portals only appear after this score)
- **Spawn Interval**: 15 seconds (increased from 5 seconds)
- **Minimum Portal Lifetime**: 10 seconds
- **Base Teleport Duration**: 4.5 seconds
- **Duration per Segment**: 150ms per snake body segment
- **Max Consecutive Teleports**: 3
- **Dynamic Spawn Probability**: 70% base, decreases with game progress

## Dynamic Spawn Probability Factors

- **Score-based**: Higher scores reduce spawn chance (50+, 100+, 200+ thresholds)
- **Length-based**: Longer snakes reduce spawn chance (20+, 40+ segments)
- **Usage-based**: Recent teleportations reduce spawn chance
- **Range**: Probability stays between 10% and 90%

## Usage

The portal system is automatically integrated into the game. No additional setup required. 