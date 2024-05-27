from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import boto3
from botocore.exceptions import ClientError
import key_config as keys
import uuid
import bcrypt
from boto3.dynamodb.conditions import Attr
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import Depends, HTTPException, status

load_dotenv()

app = FastAPI()

class User(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"  # Default role is student
    pin: str = None


class Module(BaseModel):
    Moduleid: str
    name: str
    description: str

class UserModules(BaseModel):
    Userid: str
    Moduleid: str

class VerifyPinRequest(BaseModel):
    email: str
    pin: str

dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY'),
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

def send_pin_via_email(email: str, pin: str):
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD')

    if not sender_email or not sender_password:
        raise ValueError("Missing sender email or password in environment variables.")

    print(f"Sender email: {sender_email}")
    print(f"Recipient email: {email}")
    print(f"PIN: {pin}")

    subject = "Your Verification PIN"
    body = f"Your verification PIN is {pin}"

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = email

    part = MIMEText(body, "plain")
    message.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
            print("Email sent successfully")
    except smtplib.SMTPAuthenticationError as e:
        print("Failed to authenticate with SMTP server:", e)
        raise
    except Exception as e:
        print("Failed to send email:", e)
        raise

@app.post("/send_pin")
async def send_pin(request: Request):
    data = await request.json()
    email = data.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    pin = str(random.randint(100000, 999999))
    table = dynamodb.Table('Users')
    response = table.scan(FilterExpression=Attr('Email').eq(email))
    items = response['Items']
    if items:
        table.update_item(
            Key={'Userid': items[0]['Userid']},
            UpdateExpression="set pin = :p",
            ExpressionAttributeValues={':p': pin}
        )
    else:
        table.put_item(Item={'Userid': str(uuid.uuid4()), 'Email': email, 'pin': pin})

    send_pin_via_email(email, pin)
    return {"message": "PIN sent to email"}

@app.post("/verify_pin")
async def verify_pin(verify_request: VerifyPinRequest):
    table = dynamodb.Table('Users')
    response = table.scan(FilterExpression=Attr('Email').eq(verify_request.email))
    items = response['Items']
    if items and items[0].get('pin') == verify_request.pin:
        return {"verified": True}
    else:
        return {"verified": False, "message": "Invalid PIN"}

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

@app.post("/remove_user_module")
async def remove_user_module(usermodules: UserModules):
    try:
        table = dynamodb.Table('usermodules')
        table.delete_item(
            Key={
                'Userid': usermodules.Userid,
                'Moduleid': usermodules.Moduleid
            }
        )
        return {"message": "User module removed successfully"}
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
        'Email': data['email'],
        'role': data.get('role', 'student')  # Get role from data, default to student
    }
    table.put_item(Item=item)
    print(data)
    return "data submitted successfully"

def get_current_user_role(email: str):
    table = dynamodb.Table('Users')
    response = table.scan(FilterExpression=Attr('Email').eq(email))
    items = response['Items']
    if len(items) == 1:
        return items[0]['role']
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

def admin_required(email: str = Depends(get_current_user_role)):
    if email != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

@app.post("/add_module")
async def add_module(data: dict):
    try:
        table = dynamodb.Table('modules')
        item = {
            'Moduleid': str(uuid.uuid4()),
            'name': module.name,
            'description': module.description
        }
        table.put_item(Item=item)
        return item
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.put("/update_module/{module_id}", dependencies=[Depends(admin_required)])
async def update_module(module_id: str, module: Module):
    try:
        table = dynamodb.Table('modules')
        table.update_item(
            Key={'Moduleid': module_id},
            UpdateExpression="set #name = :n, description = :d",
            ExpressionAttributeNames={'#name': 'name'},
            ExpressionAttributeValues={':n': module.name, ':d': module.description}
        )
        return {"message": "Module updated successfully"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


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
        else:
            hashed_password = items[0]['password']
            if bcrypt.checkpw(password.encode(), bytes(hashed_password)):
                return {"exists": True, "message": "Login successful", "Userid": items[0]['Userid'],"role": items[0]['role']}
            else:
                return {"exists": False, "message": "Wrong password"}
    except ClientError as e:
        return {"exists": False, "error": str(e)}