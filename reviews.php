<?php

/* =========================================
   Polyglot Translate — відгуки (API)
   GET  — повертає список відгуків
   POST — додає новий відгук
   ========================================= */

header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/reviews.json';
$rateFile = $dataDir . '/limits.json';

// Не больше 500 отзывов, чтобы файл не разросся
define('MAX_REVIEWS', 500);

// Не больше 5 отзывов в час с одного IP
define('RATE_LIMIT', 5);
define('RATE_WINDOW', 3600);

// Капча живёт 10 минут
define('CAPTCHA_TTL', 600);


function respond($code, $payload)
{
    http_response_code($code);

    echo json_encode($payload, JSON_UNESCAPED_UNICODE);

    exit;
}


function readAll($file)
{
    if (!file_exists($file)) {
        return array();
    }

    $raw = file_get_contents($file);

    if ($raw === false || trim($raw) === '') {
        return array();
    }

    $data = json_decode($raw, true);

    return is_array($data) ? $data : array();
}


/* ------------------------------------------
   UTF-8 хелпери (працюють без mbstring)
   ------------------------------------------ */

function textChars($value)
{
    return preg_match_all('/./us', (string)$value, $matches);
}


function textCut($value, $limit)
{
    preg_match_all('/./us', (string)$value, $matches);

    return implode('', array_slice($matches[0], 0, $limit));
}


function textUpper($value)
{
    if (function_exists('mb_strtoupper')) {
        return mb_strtoupper($value, 'UTF-8');
    }

    return strtoupper($value);
}


function textLower($value)
{
    if (function_exists('mb_strtolower')) {
        return mb_strtolower($value, 'UTF-8');
    }

    return strtolower($value);
}


/* ------------------------------------------
   Лимит по IP
   ------------------------------------------ */

function clientIp()
{
    return isset($_SERVER['REMOTE_ADDR'])
        ? $_SERVER['REMOTE_ADDR']
        : '0.0.0.0';
}


function checkRate($file, $ip, $limit, $window)
{
    $all = readAll($file);

    // IP не храним открытым — только хэш
    $key = substr(hash('sha256', $ip), 0, 32);

    $now = time();
    $stamps = array();

    // Чистим старые записи по всем IP
    foreach ($all as $id => $item) {

        if (!isset($item['stamps'])) {
            unset($all[$id]);
            continue;
        }

        $item['stamps'] = array_values(array_filter(
            $item['stamps'],
            function ($stamp) use ($now, $window) {

                return ($now - (int)$stamp) < $window;

            }
        ));

        if (!$item['stamps']) {
            unset($all[$id]);
            continue;
        }

        $all[$id] = $item;

        if ($id === $key) {
            $stamps = $item['stamps'];
        }

    }

    if (count($stamps) >= $limit) {

        $wait = $window - ($now - (int)$stamps[0]);

        $hours = max(1, (int)ceil($wait / 3600));

        respond(429, array(
            'ok' => false,
            'error' => 'Забагато відгуків. Спробуйте через ' . $hours . ' ' .
                ($hours === 1 ? 'годину' : 'години') . '.'
        ));

    }


    $stamps[] = $now;

    $all[$key] = array('stamps' => $stamps);

    writeAll($file, $all);

    return true;
}


/* ------------------------------------------
   Проверка капчи
   ------------------------------------------ */

function checkCaptcha($input)
{
    $expected = '';

    if (isset($_SESSION['captcha_code'])) {
        $expected = (string)$_SESSION['captcha_code'];
    } elseif (isset($_SESSION['captcha_answer'])) {
        $expected = (string)$_SESSION['captcha_answer'];
    }

    $createdAt = isset($_SESSION['captcha_time'])
        ? (int)$_SESSION['captcha_time']
        : 0;


    // Капча одноразовая — сгорает после проверки
    unset($_SESSION['captcha_code']);
    unset($_SESSION['captcha_answer']);
    unset($_SESSION['captcha_time']);


    if ($expected === '') {
        respond(422, array(
            'ok' => false,
            'error' => 'Оновіть капчу і спробуйте ще раз.'
        ));
    }

    if (time() - $createdAt > CAPTCHA_TTL) {
        respond(422, array(
            'ok' => false,
            'error' => 'Капча застаріла. Введіть новий код.'
        ));
    }

    if (!hash_equals(strtoupper($expected), strtoupper($input))) {
        respond(422, array(
            'ok' => false,
            'error' => 'Невірний код капчи.'
        ));
    }

    return true;
}


function cleanText($value, $limit)
{
    $value = trim(strip_tags((string)$value));

    // Прибираємо керуючі символи
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value);

    // Стискаємо пробіли
    $value = preg_replace('/\s+/u', ' ', $value);

    // Обрізаємо по символах, а не по байтах
    $value = textCut($value, $limit);

    return trim($value);
}


function writeAll($file, $data)
{
    $json = json_encode(
        array_values($data),
        JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    );

    if (file_put_contents($file, $json, LOCK_EX) === false) {
        respond(500, array('ok' => false, 'error' => 'Не вдалося зберегти відгук'));
    }
}


// Створюємо папку data під час першого запиту
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}


$method = $_SERVER['REQUEST_METHOD'];


// ------------------------------------------
// GET — список відгуків
// ------------------------------------------

if ($method === 'GET') {

    $reviews = readAll($dataFile);

    // Нові відгуки — першими
    usort($reviews, function ($a, $b) {

        $left = isset($a['createdAt']) ? (int)$a['createdAt'] : 0;
        $right = isset($b['createdAt']) ? (int)$b['createdAt'] : 0;

        return $right - $left;

    });

    respond(200, array('ok' => true, 'reviews' => $reviews));
}


// ------------------------------------------
// POST — новий відгук
// ------------------------------------------

if ($method !== 'POST') {
    respond(405, array('ok' => false, 'error' => 'Метод не підтримується'));
}


// Сессия нужна для проверки капчи
if (session_status() === PHP_SESSION_NONE) {

    if (!@session_start()) {
        respond(500, array(
            'ok' => false,
            'error' => 'Сесія недоступна. Оновіть сторінку.'
        ));
    }

}


// Пастка для ботів — має бути порожнім
if (!empty($_POST['website'])) {
    respond(200, array('ok' => true, 'review' => null));
}


$name = cleanText($_POST['name'] ?? '', 60);
$text = cleanText($_POST['text'] ?? '', 1000);
$rating = (int)($_POST['rating'] ?? 0);
$captcha = cleanText($_POST['captcha'] ?? '', 10);


// Перевірка полів — щоб не спалювати капчу дрібними помилками
$error = '';

if (textChars($name) < 2) {
    $error = "Вкажіть ім'я (мінімум 2 символи).";
} elseif (textChars($text) < 10) {
    $error = 'Відгук занадто короткий (мінімум 10 символів).';
} elseif ($rating < 1 || $rating > 5) {
    $error = 'Оберіть оцінку від 1 до 5 зірок.';
} elseif ($captcha === '') {
    $error = 'Введіть код капчи.';
}


if ($error !== '') {
    respond(422, array('ok' => false, 'error' => $error));
}


// Капча — одноразова, перевіряємо після полів
checkCaptcha($captcha);


// Ліміт по IP — 5 відгуків на годину
checkRate($rateFile, clientIp(), RATE_LIMIT, RATE_WINDOW);


$reviews = readAll($dataFile);


// Захист від спаму: такий самий відгук не частіше ніж раз на хвилину
$now = time();

foreach ($reviews as $item) {

    $sameName = isset($item['name']) && textLower($item['name']) === textLower($name);
    $sameText = isset($item['text']) && $item['text'] === $text;

    $age = $now - (isset($item['createdAt']) ? (int)$item['createdAt'] : 0);

    if ($sameName && $sameText && $age < 60) {
        respond(200, array('ok' => true, 'review' => null, 'duplicate' => true));
    }
}


// Ініціал для аватара
$initial = textUpper(textCut($name, 1));


$review = array(
    'id' => date('YmdHis') . '-' . substr(bin2hex(random_bytes(4)), 0, 8),
    'name' => $name,
    'text' => $text,
    'rating' => $rating,
    'initial' => $initial,
    'createdAt' => $now,
);


$reviews[] = $review;


// Не даём файлу расти бесконечно — оставляем новые
if (count($reviews) > MAX_REVIEWS) {

    usort($reviews, function ($a, $b) {

        $left = isset($a['createdAt']) ? (int)$a['createdAt'] : 0;
        $right = isset($b['createdAt']) ? (int)$b['createdAt'] : 0;

        return $right - $left;

    });

    $reviews = array_slice($reviews, 0, MAX_REVIEWS);

}

writeAll($dataFile, $reviews);


respond(201, array('ok' => true, 'review' => $review));