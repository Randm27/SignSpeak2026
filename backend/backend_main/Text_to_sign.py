from flask import Flask, request, jsonify, send_from_directory, render_template_string
import os

app = Flask(__name__)

# Папката със снимките
IMAGE_FOLDER = 'images'

@app.route('/')
def index():
    # Прост HTML за тест
    return render_template_string('''
        <input type="text" id="userInput" placeholder="Напиши дума (apple, banana)...">
        <button onclick="getImage()">Покажи снимка</button>
        <div id="result"></div>
        <script>
            async function getImage() {
                const text = document.getElementById('userInput').value;
                const response = await fetch('/get_image', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({text: text})
                });
                const data = await response.json();
                if(data.image) {
                    document.getElementById('result').innerHTML = `<img src="/images/${data.image}" width="300">`;
                } else {
                    alert("Снимката не е намерена!");
                }
            }
        </script>
    ''')

@app.route('/get_image', methods=['POST'])
def get_image():
    data = request.get_json()
    user_text = data.get('text', '').lower().strip()

    # Използваме MATCH (Python Switch), за да изберем снимка
    match user_text:
        case "apple" | "ябълка":
            image_name = "apple.jpg"
        case "banana" | "банан":
            image_name = "banana.jpg"
        case "sign" | "знак":
            image_name = "sign_language.jpg"
        case _:
            image_name = "default.jpg" # Ако нищо не съвпадне

    # Проверяваме дали файлът реално съществува
    if os.path.exists(os.path.join(IMAGE_FOLDER, image_name)):
        return jsonify({'image': image_name})
    else:
        return jsonify({'error': 'Файлът липсва'}), 404

# Маршрут за сервиране на самите снимки
@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

if __name__ == '__main__':
    if not os.path.exists(IMAGE_FOLDER):
        os.makedirs(IMAGE_FOLDER)
    app.run(debug=True, port=5000)