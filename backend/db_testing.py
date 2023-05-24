from datetime import datetime

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from server import db
from models import (
    User,
    Competition,
    UserCompetition,
    Company,
    Transaction,
    UserInventory,
    CompanyDailyPrice,
    UserDailyBalance,
)


# testing database
db.drop_all()
db.create_all()

user1 = User(user_name="Melo", email="sjfoisj@hotmail.com", balance=1000)
user2 = User(user_name="Maruna", email="90128301@gmail.com", balance=1000)
user3 = User(user_name="Snownoodle", email="oxioxix@yahoo.com", balance=1000)

db.session.add(user1)
db.session.add(user2)
db.session.add(user3)

competition1 = Competition(
    start_date=datetime(2022, 2, 1, 11, 22, 33, 44),
    end_date=datetime(2022, 3, 1, 11, 22, 33, 44),
)
db.session.add(competition1)


usercompetition5 = UserCompetition(
    user_id=1, competition_id=2, total_value=700, rank=4
)
usercompetition6 = UserCompetition(
    user_id=2, competition_id=2, total_value=800, rank=3
)
usercompetition7 = UserCompetition(
    user_id=3, competition_id=2, total_value=1110, rank=2
)
usercompetition8 = UserCompetition(
    user_id=4, competition_id=2, total_value=1400, rank=1
)

db.session.add(usercompetition5)
db.session.add(usercompetition6)
db.session.add(usercompetition7)
db.session.add(usercompetition8)

usercompetition1 = UserCompetition(
    user_id=1, competition_id=1, total_value=1523.23, rank=2
)
usercompetition2 = UserCompetition(
    user_id=2, competition_id=1, total_value=1623.23, rank=1
)
usercompetition3 = UserCompetition(
    user_id=3, competition_id=1, total_value=1423.23, rank=3
)
usercompetition4 = UserCompetition(
    user_id=4, competition_id=1, total_value=1123.23, rank=4
)

db.session.add(usercompetition1)
db.session.add(usercompetition2)
db.session.add(usercompetition3)
db.session.add(usercompetition4)


db.session.commit()
