# SIH-Web

A comprehensive web project that aims to provide innovative solutions.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction

SIH-Web is a web application developed to address specific challenges and provide users with a seamless experience.

## Features

- User-friendly interface
- Responsive design
- Secure authentication
- Real-time data updates

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/SIH-Web.git
    ```

2. Navigate to the project directory:

    ```bash
    cd SIH-Web
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

## Usage

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to view the application.

## Starting The Backend

Start the Redis server:
```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest      
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

## Start the Backend

```bash
cd cultural_analysis
python index.py
```
```bash
cd other
python index.py
```
```bash
cd similarity_score
python index.py
```