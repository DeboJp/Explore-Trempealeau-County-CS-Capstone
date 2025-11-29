FROM public.ecr.aws/lambda/python:3.11

# Copy requirements
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ${LAMBDA_TASK_ROOT}/app/

# Set the CMD to your handler (for Lambda)
CMD [ "app.main.handler" ]

# For EC2, use this CMD instead:
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
