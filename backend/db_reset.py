from server import db


# reseting database
db.drop_all()
db.create_all()


db.session.commit()
