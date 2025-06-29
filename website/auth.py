from flask import Blueprint, render_template, request, jsonify, url_for, redirect
from .models import User
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from flask_login import login_user, login_required, logout_user, current_user
import re

auth = Blueprint('auth', __name__)

# Email validation regex
EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'


@auth.route('/login', methods=['GET'])
def login_signup():
    return render_template("new_login.html", user=current_user)


@auth.route('/auth_action', methods=['POST'])
def auth_action():
    data = request.get_json()
    action = data.get('action')

    if action == 'login':
        email = data.get('email')
        password = data.get('password')

        # Validate email format
        if not re.match(EMAIL_REGEX, email):
            return jsonify({'status': 'error', 'message': 'Invalid email format'})

        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user, remember=True)
                return jsonify({'status': 'success', 'redirect': url_for('views.home')})
            else:
                return jsonify({'status': 'error', 'message': 'Incorrect password'})
        else:
            return jsonify({'status': 'error', 'message': 'Email does not exist'})

    elif action == 'signup':
        email = data.get('email')
        first_name = data.get('firstName')
        password1 = data.get('password1')
        password2 = data.get('password2')

        # Validate email format
        if not re.match(EMAIL_REGEX, email):
            return jsonify({'status': 'error', 'message': 'Invalid email format'})

        # Field validations
        user = User.query.filter_by(email=email).first()
        if user:
            return jsonify({'status': 'error', 'message': 'Email already exists'})
        elif len(email) < 4:
            return jsonify({'status': 'error', 'message': 'Email must be greater than 3 characters'})
        elif len(first_name) < 2:
            return jsonify({'status': 'error', 'message': 'First name must be greater than 1 character'})
        elif password1 != password2:
            return jsonify({'status': 'error', 'message': "Passwords don't match"})
        elif len(password1) < 7:
            return jsonify({'status': 'error', 'message': 'Password must be at least 7 characters'})
        else:
            new_user = User(
                email=email,
                first_name=first_name,
                password=generate_password_hash(password1, method='pbkdf2:sha256')
            )
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user, remember=True)
            return jsonify({'status': 'success', 'redirect': url_for('views.home')})

    return jsonify({'status': 'error', 'message': 'Invalid action'})


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('views.home'))
