<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit('Ошибка запроса');
}

$phone = trim($_POST['phone'] ?? '');

if (!$phone) {
    exit('Нет телефона');
}


$phone = preg_replace('/\D/', '', $phone);


if (strlen($phone) !== 9) {
    exit('Неверный номер');
}


$phone = '+380' . $phone;


$to = 'kakoito@mail.ru';

$subject = 'Заявка на обратный звонок';

$message = "Новая заявка на обратный звонок\n\n";
$message .= "Телефон: " . $phone;


$headers = [];
$headers[] = 'From: info@polyglot-translate.org.ua';
$headers[] = 'Reply-To: info@polyglot-translate.org.ua';
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';


if (mail($to, $subject, $message, implode("\r\n", $headers))) {

    echo "success";

} else {

    echo "error";

}
