<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit('Метод не разрешен.');
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

// Проверяем обязательные поля
if (empty($name) || empty($email) || empty($phone) || empty($message)) {
    exit('Все поля обязательны для заполнения.');
}

// Проверяем email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    exit('Неверный адрес электронной почты.');
}

// Убираем всё кроме цифр
$phone = preg_replace('/\D/', '', $phone);

// Проверяем 9 цифр
if (!preg_match('/^[0-9]{9}$/', $phone)) {
    exit('Неверный номер телефона.');
}

// Добавляем код Украины
$phone = '+380' . $phone;

// Куда отправлять письмо
$to = 'kakoito@mail.com';

// Тема
$subject = 'Новая заявка с сайта';

// Текст письма
$body = "Новая заявка с сайта\n\n";
$body .= "Имя: " . $name . "\n";
$body .= "Email: " . $email . "\n";
$body .= "Телефон: " . $phone . "\n\n";
$body .= "Сообщение:\n" . $message . "\n";

// Отправитель должен быть с твоего домена
$headers = "From: info@polyglot-translate.org.ua\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Отправляем
if (mail($to, $subject, $body, $headers)) {
    echo "success";
} else {
    http_response_code(500);
    echo "Ошибка при отправке сообщения.";
}
