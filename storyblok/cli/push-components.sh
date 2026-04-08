#!/bin/bash

# Get all json files in blocks directory
SOURCE_FILES=$(find storyblok/blocks -name "*.json" | tr '\n' ',' | sed 's/,$//')

# Check if space ID is provided as argument
if [ -z "$1" ]; then
    read -p "Enter Storyblok Space ID to push components to: " STORYBLOK_SPACE_ID
else
    STORYBLOK_SPACE_ID=$1
fi

storyblok push-components $SOURCE_FILES --space $STORYBLOK_SPACE_ID