from flask import Flask, request
from transformers import pipeline

detector = pipeline('text-classification',
	model='papluca/xlm-roberta-base-language-detection')
translator = pipeline('translation',
	model='Helsinki-NLP/opus-mt-es-en')
en_classifier = pipeline("text-classification", 
	model='bhadresh-savani/distilbert-base-uncased-emotion')#, return_all_scores=True)

def predict(text):
	lang = detector(text)[0]['label']
	if lang == 'en':
		return en_classifier(text)
	else:
		en_text = translator(text)[0]['translation_text']
		return en_classifier(en_text)


app = Flask(__name__)
@app.get('/')
def hello():
	return 'hello'


@app.post('/')
def test():
	text = request.get_json()['text']
	return predict(text)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, threaded=True)
