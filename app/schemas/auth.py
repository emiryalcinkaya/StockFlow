from pydantic import BaseModel

class LoginRequest(BaseModel):
	username: str
	password: str

class LoginResponse(BaseModel):
	message: str
	username: str
