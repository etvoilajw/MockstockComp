import datetime
from dateutil.relativedelta import relativedelta

from server import db
from models import (
    Competition,
)

TODAY = datetime.date.today()

# reseting database
db.drop_all()
db.create_all()

# start a new competition which ends in 1 month period starting from today.
db.session.add(Competition(start_date=TODAY,
               end_date=TODAY + relativedelta(months=1, seconds=-1)))

db.session.commit()
