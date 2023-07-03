import datetime
import math
import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import finnhub

from server import db
from models import (
    CompanyDailyPrice,
    User,
    Competition,
    UserCompetition,
    Company,
    Transaction,
    UserDailyBalance,
    UserInventory,
)

TODAY = datetime.date.today()
COMPETITION_ID = (
    Competition.query.order_by(
        Competition.competition_id.desc()).first().competition_id
)

# Setup client
finnhub_client = finnhub.Client(api_key=os.environ["FINNHUB_API_KEY"])

# Update prices of all companies being traded by users daily in DB

# Get full list of companies that was traded by users
companies = Company.query.all()

# Loop through the list of companies and check whether that company's price
# is stored for today's date, if not add to DB.
for company in companies:
    quote = finnhub_client.quote(company.symbol)
    if not CompanyDailyPrice.query.filter(
        (CompanyDailyPrice.symbol == company.symbol) & (
            CompanyDailyPrice.date == TODAY)
    ).first():
        db.session.add(
            CompanyDailyPrice(symbol=company.symbol,
                              date=TODAY, price=quote["c"])
        )

db.session.commit()

# Update daily user balance (stock porfolio + Cash balance)

# Get full list of all users
users = User.query.all()

# Sum up all stock values users have on today's date plus cash balance.
for user in users:
    if not UserDailyBalance.query.filter(
        (UserDailyBalance.user_id == user.user_id) & (
            UserDailyBalance.date == TODAY)
    ).first():
        user_stocks = UserInventory.query.filter(
            (UserInventory.user_id == user.user_id)
            & (UserInventory.competition_id == COMPETITION_ID)
        ).all()
        balance = 0
        for stock in user_stocks:
            stock_price = (
                CompanyDailyPrice.query.filter(
                    (CompanyDailyPrice.symbol == stock.symbol)
                    & (CompanyDailyPrice.date == TODAY)
                )
                .first()
                .price
            )
            balance += stock_price * stock.shares
        total_balance = user.balance + balance
        db.session.add(
            UserDailyBalance(user_id=user.user_id, date=TODAY,
                             cash_balance=user.balance, stock_balance=balance, total_balance=total_balance)
        )

# Update user_competition rankings

# clear current competition ranking entries
UserCompetition.query.filter_by(competition_id=COMPETITION_ID).delete()
db.session.commit()

# Fetching all users' today balances
user_balances = UserDailyBalance.query.filter_by(
    date=TODAY).order_by(UserDailyBalance.total_balance.desc()).all()
# Re-adding today's competition rankings
for index, user_balance in enumerate(user_balances, start=1):
    db.session.add(
        UserCompetition(
            user_id=user_balance.user_id,
            competition_id=COMPETITION_ID,
            total_value=user_balance.total_balance,
            rank=index,
        )
    )



db.session.commit()
