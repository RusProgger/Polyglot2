<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $message = trim($_POST['message'] ?? '');

    // Проверка обязательных полей
    if (empty($name) || empty($email) || empty($phone) || empty($message)) {
        die('Все поля обязательны для заполнения.');
    }

    // Проверка email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die('Неверный адрес электронной почты.');
    }

    // Проверка телефона
    if (!preg_match('/^380[0-9]{9}$/', $phone)) {
        die('Неверный номер телефона.');
    }

    // Получатель
    $to = 'ruslantimka92@gmail.com';

    // Тема
    $subject = 'Новое сообщение с сайта';

    // Тело письма
    $body = "Имя: $name\n";
    $body .= "Email: $email\n";
    $body .= "Телефон: $phone\n\n";
    $body .= "Сообщение:\n$message";

    // Заголовки
    $headers = "From: info@polyglot-translate.org.ua\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Отправка
    if (mail($to, $subject, $body, $headers)) {

        $_SESSION['message_sent'] = true;

        header('Location: success.php');
        exit();

    } else {

        echo 'Ошибка при отправке сообщения.';
    }

} else {

    http_response_code(404);
    echo 'Страница не найдена.';
}
?>
