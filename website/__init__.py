from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
import os
from datetime import timedelta

db = SQLAlchemy()
DB_NAME = "database.db"

def create_app():
    app = Flask(__name__)

    # Secret key for cookies/session security
    app.config['SECRET_KEY'] = 'asdfafasfd asdwrwrwr92as asdsfafa78'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'

    # -----------------------------
    # Fixes for Hugging Face Spaces
    # -----------------------------
    # Session config for Hugging Face / HTTPS
    app.config['SESSION_COOKIE_SECURE'] = True  # 🔐 Required for HTTPS cookies
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # ✅ Allow JS-based login
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=7)


    db.init_app(app)

    from .views import views
    from .auth import auth

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import User, Note
    create_database(app)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login_signup'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    return app


def create_database(app):
    if not path.exists('instance/' + DB_NAME):
        with app.app_context():
            db.create_all()
            print('Created Database!')
