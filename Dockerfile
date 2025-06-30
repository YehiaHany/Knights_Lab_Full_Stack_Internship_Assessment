# Use official Python image
FROM python:3.9

# Install system dependencies needed by OpenCV and others
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 user
USER user

# Set working directory
WORKDIR /main

# Copy and install requirements
COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY --chown=user . .

# Set Flask environment variables
ENV FLASK_APP=main.py

# Run app using Flask CLI via python (safer than flask binary)
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=7860"]