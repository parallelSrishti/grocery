from flask import current_app as app,render_template,send_file,jsonify
from flask_security import auth_required,roles_required
from celery.result import AsyncResult
from .tasks import export_csv

@app.get('/')
def home():
    return render_template("index.html")



@app.get('/export-csv')
@auth_required('token')
@roles_required('manager')
def Export_csv():
    try:
        task = export_csv.delay()
        return jsonify({"taskID":task.id})
    except Exception as e:
        print(e)
        return jsonify({"error":"Internal server error"}),500



@app.get('/download-csv/<taskID>')
def download_csv(taskID):
    try:
        print(taskID)
        res = AsyncResult(taskID)
        print(res)
        if res.ready():
            filename = res.result
            return send_file(filename,as_attachment=True)
        else:
            return jsonify({"message":"task is pending"}),400
    except Exception as e:
        print(e)
        return jsonify({"error":"Internal server error"}),500 