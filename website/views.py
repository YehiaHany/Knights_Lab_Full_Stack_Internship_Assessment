from flask import Blueprint, render_template,request
from flask_login import login_required, current_user
from PIL import Image
from os import path
import base64
from io import BytesIO
from website.utils.predict import run_all_models

views = Blueprint('views',__name__)

@views.route('/') # decorator
def home():
    return render_template("new_home.html", user=current_user)

@views.route('/about') # decorator
def about():
    return render_template("about.html", user=current_user)



@views.route('/analyze', methods=['GET', 'POST'])
@login_required
def analyze():
    if request.method == 'POST':
        file = request.files['image']
        if file:
            image = Image.open(file.stream).convert("RGB")
            img_cls, img_det, img_seg, label = run_all_models(image)

            if img_seg is None:
                return render_template('new_analyze.html', classification=label, no_pets=True,user=current_user)

            # Convert images to base64
            def image_to_base64(img):
                buffer = BytesIO()
                img.save(buffer, format='JPEG')
                buffer.seek(0)
                return base64.b64encode(buffer.read()).decode()

            img_cls_b64 = image_to_base64(img_cls)
            img_det_b64 = image_to_base64(img_det)
            img_seg_b64 = image_to_base64(img_seg)

            return render_template(
                'new_analyze.html',
                img_cls=img_cls_b64,
                img_det=img_det_b64,
                img_seg=img_seg_b64,
                classification=label,
                no_pets=False,
                user=current_user
            )

    return render_template("new_analyze.html", user=current_user)

