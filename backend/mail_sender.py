from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


SMTP_HOST = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'srishti@store.com'
SENDER_PASSWORD = ''

def monthly_report_email_as_html(to,subject,content_body):
    message = MIMEMultipart()
    message['To'] = to
    message['Subject'] = subject
    message['From'] =  SENDER_EMAIL
    message.attach(MIMEText(content_body,'html'))
    client = SMTP(host = SMTP_HOST,port=SMTP_PORT)
    client.send_message(msg=message)
    client.quit()

def daily_remainder_mail_as_plain(to,subject,content_body):
    message = MIMEMultipart()
    message['To'] = to
    message['Subject'] = subject
    message['From'] =  SENDER_EMAIL
    message.attach(MIMEText(content_body,'plain'))
    client = SMTP(host = SMTP_HOST,port=SMTP_PORT)
    client.send_message(msg=message)
    client.quit()
