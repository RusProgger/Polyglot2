<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Метод не разрешен');
}

$phone = $_POST['phone'] ?? '';

$phone = preg_replace('/\D/', '', $phone);

if (!preg_match('/^\d{9}$/', $phone)) {
    http_response_code(400);
    exit('Неверный номер телефона');
}

// ВАША ПОЧТА
$to = 'mailto:juliaads22@gmail.com';

$fullPhone = '+380' . $phone;

$subject = 'Новая заявка на обратный звонок';

$message = "Новая заявка с сайта.\n\n";
$message .= "Номер телефона: " . $fullPhone . "\n";
$message .= "Дата: " . date('d.m.Y H:i:s') . "\n";

$headers = "From: website@your-domain.com\r\n";
$headers .= "Reply-To: website@your-domain.com\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo 'success';
} else {
    http_response_code(500);
    echo 'Ошибка отправки';
}
