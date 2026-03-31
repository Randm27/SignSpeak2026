import cv2, os

gesture_name = "c"
os.makedirs(f"dataset/{gesture_name}", exist_ok=True)

cap = cv2.VideoCapture(0)
count = 0

print("Press SPACE to capture, Q to quit")
while True:
    ret, frame = cap.read()
    cv2.imshow("Capture", frame)
    key = cv2.waitKey(1)
    if key == 32:  # SPACE
        cv2.imwrite(f"dataset/{gesture_name}/{count}.jpg", frame)
        count += 1
        print(f"Captured {count}")
    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()