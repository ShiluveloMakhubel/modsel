from fastapi import FastAPI, UploadFile, File
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import boto3
import key_config as keys
import uuid



app = FastAPI()

import boto3

dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id='AKIA5FTZFJQBUJAE37FA',
    aws_secret_access_key='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',
    region_name='eu-north-1'
)



# Set up CORS
origins = [
    "http://localhost:3000",
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"name": "aniket", "age":24}


@app.get("/getAllBooks")
def getall():
    table = dynamodb.Table('Users')
    items = table.scan()
    print(items)
    return items

 
@app.post("/submitdata")
async def submitdata(data:dict):
    table = dynamodb.Table('Users')
    
    item = {
       'Userid': str(uuid.uuid4()),
        'username': data['username'],
        'password': data['password'],
        'Email': data['email']
    }
    table.put_item(Item = item)
    print(data)
    return "data submitted successfully"
    
