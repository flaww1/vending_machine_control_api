const express = require('express');
const morgan = require('morgan');

const fs = require('fs');
const path = require('path');
// Create a write stream for the access log file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/access.log'), { flags: 'a' });

// Configure morgan logger middleware
const logger = morgan('combined', { stream: accessLogStream });
