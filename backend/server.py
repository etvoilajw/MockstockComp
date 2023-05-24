import flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = flask.Flask("project_1")
CORS(app)
# setup database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

import api
