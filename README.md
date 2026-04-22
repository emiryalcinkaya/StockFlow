# StockFlow

StockFlow is a full-stack inventory management system designed to simulate how real-world stock and sales operations are handled in a structured and reliable way.

It focuses on building a solid backend foundation while delivering a clean and functional user interface.

## What This Project Does

StockFlow allows you to manage the full lifecycle of products and sales:

- Create and manage products with unique identifiers  
- Control stock levels with strict validation  
- Process sales involving multiple items  
- Maintain consistent and reliable sales history  

The system is built to prevent common real-world issues such as duplicate entries, invalid stock updates, and data loss.

## Core Idea

Instead of building a simple CRUD application, this project focuses on **how data should behave in a real system**.

Key decisions include:

- Products are not permanently deleted — they are archived to preserve historical data  
- Stock cannot go below zero under any condition  
- Every sale is stored with its own snapshot of product data  
- All critical operations are validated at the backend level  

## Tech Stack

**Backend**
- FastAPI  
- SQLAlchemy  
- PostgreSQL  
- Pydantic  

**Frontend**
- Vanilla JavaScript  
- Modular CSS  
- Component-based structure  

## Structure

backend/  
frontend/  

The backend handles all business logic and validation, while the frontend communicates through a clean API layer.

## Running the Project

uvicorn app.main:app --reload

Then open:

frontend/index.html

## Why This Project Matters

This project demonstrates the ability to:

- Design a structured backend system  
- Build a reliable API with proper validation  
- Model real-world data relationships  
- Connect a frontend interface to a working backend  
- Handle edge cases beyond basic CRUD  

## Status

Core system is complete and functional.  
Open for further improvements and scaling.

## Developed by Emir Yalçınkaya
