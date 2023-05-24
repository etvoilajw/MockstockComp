from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from server import db


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0)
    user_competitions_user = db.relationship(
        "UserCompetition", backref="user", lazy=True
    )
    transactions_user = db.relationship("Transaction", backref="user", lazy=True)
    user_userDailyBalance = db.relationship(
        "UserDailyBalance", backref="user", lazy=True
    )


class Competition(db.Model):
    competition_id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    user_competitions_competition = db.relationship(
        "UserCompetition", backref="competition", lazy=True
    )


class UserCompetition(db.Model):
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.user_id"), primary_key=True, nullable=False
    )
    competition_id = db.Column(
        db.Integer,
        db.ForeignKey("competition.competition_id"),
        primary_key=True,
        nullable=False,
    )
    total_value = db.Column(db.Float, nullable=False)
    rank = db.Column(db.Integer, nullable=False)


class Company(db.Model):
    symbol = db.Column(db.String(100), primary_key=True)
    transactions_company = db.relationship("Transaction", backref="company", lazy=True)
    company_daily_price_company = db.relationship(
        "CompanyDailyPrice", backref="company", lazy=True
    )


class Transaction(db.Model):
    transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    symbol = db.Column(
        db.String(100),
        db.ForeignKey("company.symbol"),
        nullable=False,
    )
    shares = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime, nullable=False)
    is_buy = db.Column(db.Integer, nullable=False)


class UserInventory(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), primary_key=True)
    competition_id = db.Column(
        db.Integer, db.ForeignKey("competition.competition_id"), primary_key=True
    )
    symbol = db.Column(
        db.String(100), db.ForeignKey("company.symbol"), primary_key=True
    )
    shares = db.Column(db.Float, nullable=False)


class CompanyDailyPrice(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    symbol = db.Column(db.String(100), db.ForeignKey("company.symbol"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    price = db.Column(db.Integer, nullable=False)


class UserDailyBalance(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    date = db.Column(db.Date)
    cash_balance = db.Column(db.Integer)
    stock_balance = db.Column(db.Integer)
