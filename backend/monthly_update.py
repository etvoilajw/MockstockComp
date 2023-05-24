import datetime
from dateutil.relativedelta import relativedelta
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from server import db
from models import (
    User,
    Competition,
)

TODAY = datetime.date.today()

# start a new competition which ends in 1 month period.
db.session.add(Competition(start_date=TODAY,
               end_date=TODAY + relativedelta(months=1, seconds=-1)))

db.session.commit()

# Refresh user cash balance to $1000

users = User.query.all()

for user in users:
    user.balance = 1000

db.session.commit()
