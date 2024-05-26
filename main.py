from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import boto3
from botocore.exceptions import ClientError
import key_config as keys
import uuid
import bcrypt
from boto3.dynamodb.conditions import Attr
from pydantic import BaseModel

app = FastAPI()

class Module(BaseModel):
    Moduleid: str
    name: str
    description: str

class UserModules(BaseModel):
    Userid: str
    Moduleid: str

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

@app.get("/modules")
def get_modules():
    try:
        table = dynamodb.Table('modules')
        response = table.scan()
        items = response['Items']
        return items
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/add_user_module")
async def add_user_module(usermodules: UserModules):
    try:
        table = dynamodb.Table('usermodules')
        item = {
            'Userid': usermodules.Userid,
            'Moduleid': usermodules.Moduleid
        }
        table.put_item(Item=item)
        return {"message": "User module added successfully"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/user_modules/{user_id}")
async def get_user_modules(user_id: str):
    try:
        usermodules_table = dynamodb.Table('usermodules')
        modules_table = dynamodb.Table('modules')

        response = usermodules_table.scan(FilterExpression=Attr('Userid').eq(user_id))
        user_modules = response['Items']

        registered_modules = []
        for um in user_modules:
            module_response = modules_table.get_item(Key={'Moduleid': um['Moduleid']})
            if 'Item' in module_response:
                registered_modules.append(module_response['Item'])

        return registered_modules
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/")
def read_root():
    return {"name": "aniket", "age": 24}

@app.get("/getAllAccounts")
def getall():
    table = dynamodb.Table('Users')
    items = table.scan()
    print(items)
    return items

@app.post("/submitdata")
async def submitdata(data: dict):
    table = dynamodb.Table('Users')

    hashed_password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())

    item = {
        'Userid': str(uuid.uuid4()),
        'username': data['username'],
        'password': hashed_password,
        'Email': data['email']
    }
    table.put_item(Item=item)
    print(data)
    return "data submitted successfully"

@app.get("/checkEmail")
async def check_email(email: str):
    try:
        table = dynamodb.Table('Users')
        response = table.get_item(Key={'Email': email})
        return {"exists": 'Item' in response}
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            return {"exists": False}
        else:
            return {"error": str(e)}

@app.get("/login")
async def login(email: str, password: str):
    try:
        table = dynamodb.Table('Users')
        response = table.scan(FilterExpression=Attr('Email').eq(email))
        items = response['Items']
        if len(items) == 0:
            return {"exists": False, "message": "Email not found"}
        elif len(items) == 1:
            hashed_password = items[0]['password']
            if bcrypt.checkpw(password.encode(), bytes(hashed_password)):
                return {"exists": True, "message": "Login successful", "Userid": items[0]['Userid']}
            else:
                return {"exists": False, "message": "Wrong password"}
        else:
            return {"exists": False, "message": "Multiple users found with the same email"}
    except ClientError as e:
        return {"exists": False, "error": str(e)}
