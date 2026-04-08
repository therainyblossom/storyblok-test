#!/bin/bash

source .env

storyblok pull-components --space $STORYBLOK_SPACE --separate-files --path storyblok/blocks/