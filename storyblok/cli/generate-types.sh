#!/bin/bash

source .env 

# Get all json files in blocks directory
SOURCE_FILES=$(find storyblok/blocks -name "*.json" | tr '\n' ',' | sed 's/,$//')

storyblok generate-typescript-typedefs --sourceFilePaths $SOURCE_FILES --destinationFilePath types/storyblok.d.ts
