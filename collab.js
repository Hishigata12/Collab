require("dotenv").config()
const https = require('https')
const http = require('http');
const httpProxy = require('http-proxy');
const express = require('express')
const app = express()
// const Joi = require('joi');
const path = require('path')
// const os = require('os')
const fs = require('fs')
// const EventEmitter = require('events')
const cors = require("cors")
// const { spawn } = require('child_process');
// const { exec } = require('child_process')
// const {parse} = require('csv-parse');
// const readline = require('readline')


app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public/')))
app.use(express.urlencoded({extended: false}))
// app.use(cookieParser());

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs')
app.engine('ejs', require('ejs').__express)

// // environment variable
const port = process.env.PORT || 3000 // use the chosen variable if available, if not use 3000
app.listen(port, () => console.log(`Listening on port ${port}`))