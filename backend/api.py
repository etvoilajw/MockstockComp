import os
import json
import time
import datetime
from collections import defaultdict

import flask
import finnhub
import pandas as pd
import numpy as np
from flask_cors import cross_origin
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

from server import app
from server import db
from models import (
    CompanyDailyPrice,
    User,
    Competition,
    UserCompetition,
    Company,
    Transaction,
    UserInventory,
    CompanyDailyPrice,
    UserDailyBalance,
)
from auth0 import requires_auth

# development purposes only
# setting up a new db every time server runs
# db.drop_all()
# db.create_all()

COMPANIES = [
    "AAPL",
    "MSFT",
    "TSLA",
    "AMZN",
    "META",
    "GOOGL",
    "GOOG",
    "NFLX",
]
load_dotenv()

# Setup client
finnhub_client = finnhub.Client(api_key=os.environ["FINNHUB_API_KEY"])

COMPANY_DATA = pd.read_csv("data/current_stocks.csv")

DESCRIPTIONS = COMPANY_DATA["description"].to_numpy(dtype="str")
SYMBOLS = COMPANY_DATA["displaySymbol"].to_numpy(dtype="str")

TIME_CONVERTER = 60 * 60 * 24 * 30

CURRENT_COMPETITION_ID = (
    Competition.query.order_by(
        Competition.competition_id.desc()).first().competition_id
)


def format_company_price(company, quote, symbol=None):
    return {
        "name": company,
        "cur_price": quote["c"],
        # current price - previous close price
        "difference": quote["c"] - quote["pc"],
        "symbol": symbol,
    }


@app.route("/user/check", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def check_user():
    # check if user is in user db table
    # if not create user in db
    # return user Id integer to frontend as response
    params = json.loads(flask.request.data.decode())
    name, user_email = params.get("name"), params.get("email")
    if not name or not user_email:
        return flask.jsonify({"error": "Missing input"}), 401
    user = User.query.filter_by(email=user_email).first()
    if not user:
        new_user = User(user_name=name, email=user_email, balance=1000)
        db.session.add(new_user)
        db.session.commit()
        new_user1 = User.query.filter_by(email=user_email).first()
        user_inventory = defaultdict(defaultdict)
        return flask.jsonify(
            {
                "userId": new_user1.user_id,
                "balance": new_user1.balance,
                "userInventory": user_inventory,
                "currentCompetitionId": CURRENT_COMPETITION_ID
            }
        )
    # Format UserInventory to dictionary => {competition: {symbol: shares}}
    user_inventory_list = (
        UserInventory.query.filter_by(user_id=user.user_id)
        .order_by(UserInventory.competition_id)
        .all()
    )

    user_inventory = defaultdict(defaultdict)
    for row in user_inventory_list:
        user_inventory[row.competition_id][row.symbol] = row.shares
    return flask.jsonify(
        {
            "userId": user.user_id,
            "balance": user.balance,
            "userInventory": user_inventory,
            "currentCompetitionId": CURRENT_COMPETITION_ID
        }
    )


@app.route("/news", methods=["GET"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_market_news():
    return flask.jsonify(
        {"news_data": finnhub_client.general_news(category="general")[:12]}
    )


@app.route("/stock/popular", methods=["GET"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_popular_stock():
    stock_current_price = []
    for company in COMPANIES:
        quote = finnhub_client.quote(company)
        stock_current_price.append(format_company_price(company, quote))

    return flask.jsonify({"data": stock_current_price})


@app.route("/stock/search", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_searched_stock():
    if flask.request.method == "POST":
        params = json.loads(flask.request.data.decode())
        searched_text = params.get("input")

        # searched_companies = finnhub_client.symbol_lookup(searched_text)["result"]
        # using pandas to read csv
        # e.g., pd.read_csv(path) - find a way of ignoring the index

        # loop over the column, description to find potential companies
        # using list comprehension wher comp is pd's DataFrame
        # "APPLE" = user input example
        # t = [{'comp': comp, 'symbol': symbol} for (comp, symbol) in zip(t, sym) if "APPLE" in comp]

        temp = [
            {"description": comp, "symbol": symbol}
            for (comp, symbol) in zip(DESCRIPTIONS, SYMBOLS)
            if searched_text.upper() in comp
        ]
        stock_current_price = []
        for company in temp:
            quote = finnhub_client.quote(company["symbol"])
            stock_current_price.append(
                format_company_price(
                    company["description"], quote, symbol=company["symbol"]
                )
            )

    return flask.jsonify({"data": stock_current_price})


@app.route("/stock/candle", methods=["GET"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_historical_price():
    company_name = flask.request.args.get("company_name")

    if company_name:
        data = finnhub_client.stock_candles(
            company_name, "D", int(time.time()) -
            TIME_CONVERTER, int(time.time())
        )
        return flask.jsonify(
            {
                "close_price": data["c"],
                "timestamp": data["t"],
            }
        )

    return flask.jsonify({"error": "Missing company name"})


@app.route("/stock/buy", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def buy_stock():
    params = json.loads(flask.request.data.decode())
    symbol = params.get("symbol")
    shares = float(params.get("shares"))
    user_id = params.get("userId")
    if not symbol or not shares or not user_id:
        return flask.jsonify({"error": "Missing input"}), 401
    if shares <= 0:
        return flask.jsonify({"error": "Share needs to be greater than 0"}), 402
    if not Company.query.filter(Company.symbol == symbol).first():
        new_company = Company(symbol=symbol)
        db.session.add(new_company)

    # Check if there is company's today price data in DB, if yes then use that otherwise fetch from Finnhub and add this new company price to DB.
    company_price = CompanyDailyPrice.query.filter(
        (CompanyDailyPrice.symbol == symbol)
        & (CompanyDailyPrice.date == datetime.date.today())
    ).first()
    if not company_price:
        quote = finnhub_client.quote(symbol)
        price = quote["c"]
        db.session.add(
            CompanyDailyPrice(
                symbol=symbol, date=datetime.date.today(), price=price)
        )
    else:
        price = company_price.price

    # check if able purchase order
    user = User.query.filter_by(user_id=user_id).first()
    # Case: does not have enough balance
    if user.balance < price * shares:
        return flask.jsonify({"error": "Not enough balance"}), 400

    # Case:Has enough balance to purchase
    # decrease balance
    user.balance -= price * shares
    # create transaction
    transaction = Transaction(
        user_id=user_id,
        symbol=symbol,
        shares=shares,
        price=price,
        purchase_date=datetime.datetime.now(),
        is_buy=1,
    )
    # Update UserInventory db for this user's share holdings
    # Check if user already had this share before
    currentInventory = UserInventory.query.filter(
        (UserInventory.user_id == user_id) & (UserInventory.symbol == symbol)
    ).first()
    if currentInventory:
        currentInventory.shares += shares
    else:
        # if current user never held this share before, add new UserInventory entry
        current_competition_id = Competition.query.order_by(
            Competition.competition_id.desc()).first().competition_id
        currentInventory = UserInventory(
            user_id=user_id,
            symbol=symbol,
            shares=shares,
            competition_id=current_competition_id,
        )
        db.session.add(currentInventory)

    # update db
    db.session.add(transaction)
    db.session.commit()
    return flask.jsonify(
        {"balance": user.balance, "userInventory": currentInventory.shares}
    )


@app.route("/stock/sell", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def sell_stock():
    params = json.loads(flask.request.data.decode())
    symbol = params.get("symbol")
    shares = float(params.get("shares"))
    user_id = params.get("userId")
    if not symbol or not shares or not user_id:
        return flask.jsonify({"error": "Missing input"}), 403
    if shares <= 0:
        return flask.jsonify({"error": "Share needs to be greater than 0"}), 402

    price = (
        CompanyDailyPrice.query.filter(
            (CompanyDailyPrice.symbol == symbol)
            & (CompanyDailyPrice.date == datetime.date.today())
        )
        .first()
        .price
    )

    # check if user holds current shares
    holding_shares = UserInventory.query.filter(
        (UserInventory.user_id == user_id) & (UserInventory.symbol == symbol)
    ).first()
    # Case: does not hold any shares
    if not holding_shares:
        return (
            flask.jsonify(
                {"error": "You don't own any shares for this company"}),
            400,
        )

    # Case: does not hold enough shares
    if holding_shares.shares < shares:
        return flask.jsonify({"error": "You don't have enough shares to sell"}), 401

    # Case:Has enough shares to sell
    # increase balance
    user = User.query.filter_by(user_id=user_id).first()
    user.balance += price * shares
    # create transaction
    transaction = Transaction(
        user_id=user_id,
        symbol=symbol,
        shares=shares,
        price=price,
        purchase_date=datetime.datetime.now(),
        is_buy=0,
    )
    # update UserInventory
    holding_shares.shares -= shares

    # update db
    db.session.add(transaction)
    db.session.commit()
    return flask.jsonify(
        {"balance": user.balance, "userInventory": holding_shares.shares}
    )


@app.route("/stock/value", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_total_value():
    params = json.loads(flask.request.data.decode())
    user_id = params.get("userId")

    if not user_id:
        return flask.jsonify({"error": "Missing User"}), 401

    # check if user holds current shares
    holding_shares = UserInventory.query.filter(
        (UserInventory.user_id == user_id)).all()

    # add up values of invested shares
    accumulated_value = 0
    for company_shares in holding_shares:
        quote = finnhub_client.quote(company_shares.symbol)
        price = quote["c"]
        accumulated_value += price * company_shares.shares

    return flask.jsonify({"total_share_value": accumulated_value})


@app.route("/stock/invested", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_invested_stock():
    params = json.loads(flask.request.data.decode())
    user_id = params.get("userId")
    
    if not user_id:
        return flask.jsonify({"error": "Missing User"}), 401

    invested_companies = UserInventory.query.filter(
        (UserInventory.user_id == user_id)).all()

    invested_shares = []

    for company in invested_companies:
        quote = finnhub_client.quote(company.symbol)
        quote["c"] = quote["c"] * company.shares
        invested_shares.append(format_company_price(company.symbol, quote))

    return flask.jsonify({"data": invested_shares})


@app.route("/stock/graph", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_dashboard_graph():
    """params = json.loads(flask.request.data.decode())
    user_id = params.get("userId")
    
    if not user_id:
        return flask.jsonify({"error": "Missing User"}), 401

    """
    graph_value_company = CompanyDailyPrice.query.filter(
        (CompanyDailyPrice.symbol == "AAPL")).order_by(UserDailyBalance.date).all()

    graph_value_balance = UserDailyBalance.query.filter(
        (UserDailyBalance.user_id == 1)).order_by(UserDailyBalance.date).all()

    # use list or dictionary comprehension
    return flask.jsonify({
        "company_daily": graph_value_company,
        "balance_daily": graph_value_balance,
    })
    



@app.route("/competition/data", methods=["GET"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_competition_data():
    competition_database = UserCompetition.query.order_by(
        UserCompetition.competition_id, UserCompetition.rank
    ).all()

    competition_data = {}
    for row in competition_database:
        user = User.query.filter_by(user_id=row.user_id).first()
        user_data = {
            "rank": row.rank,
            "user_name": user.user_name,
            "total_value": row.total_value,
        }
        if competition_data.get(row.competition_id):
            competition_data[row.competition_id].append(user_data)
        else:
            competition_data[row.competition_id] = [user_data]

    return flask.jsonify({"competitionData": competition_data})


@app.route("/past/competition/data", methods=["GET"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def get_user_past_competition_data():
    user_id = flask.request.args.get("user_id")

    competition_database = UserCompetition.query.filter_by(user_id=user_id).order_by(
        UserCompetition.competition_id).all()

    past_competition_data = {}
    for row in competition_database:
        past_competition_data[row.competition_id] = {
            "rank": row.rank,
            "total_value": row.total_value,
        }

    return flask.jsonify({"pastCompetitionData": past_competition_data})


@app.route("/user/logout", methods=["GET"])
@cross_origin(headers=["Content-Type", "Authorization"])
@requires_auth
def user_logout():
    user_id = flask.request.args.get("user_id")

    # Delete all transaction for Guest and reset balance to 1000 when log out

    Transaction.query.filter_by(user_id=user_id).delete()
    UserInventory.query.filter_by(user_id=user_id).delete()
    user = User.query.filter_by(user_id=user_id).first()
    user.balance = 1000

    db.session.commit()

    return flask.jsonify({"message": "Logged out!"})
