<?php

/* =========================================
   Polyglot Translate — Captcha
   Без внешних сервисов: код генерируется
   на сервере и хранится в сессии
   ========================================= */

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');


if (!@session_start()) {

    header('Content-Type: application/json; charset=utf-8');

    http_response_code(500);

    echo json_encode(
        array('ok' => false, 'error' => 'Сесія недоступна, оновіть сторінку'),
        JSON_UNESCAPED_UNICODE
    );

    exit;

}


// Есть ли GD — иначе показываем пример
$hasGD = function_exists('imagecreatetruecolor')
    && function_exists('imagepng')
    && function_exists('imagesetpixel');


// Знаки без похожих: без I, O, 0, 1
$alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';


function randomCode($alphabet, $length)
{
    $code = '';

    for ($i = 0; $i < $length; $i++) {
        $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }

    return $code;
}


/* ------------------------------------------
   Картинка с кодом
   ------------------------------------------ */

if (isset($_GET['img']) && $hasGD) {

    $code = randomCode($alphabet, 4);

    // Код в сессию — reviews.php его сверит
    $_SESSION['captcha_code'] = $code;
    $_SESSION['captcha_time'] = time();
    unset($_SESSION['captcha_answer']);

    $width = 200;
    $height = 70;

    $image = @imagecreatetruecolor($width, $height);


    // Если GD сломан — отдаём пример, а не битую картинку
    if ($image === false) {

        $first = random_int(2, 9);
        $second = random_int(1, 9);

        $_SESSION['captcha_code'] = null;
        $_SESSION['captcha_answer'] = (string)($first + $second);
        $_SESSION['captcha_time'] = time();

        header('Content-Type: application/json; charset=utf-8');

        echo json_encode(
            array('ok' => true, 'type' => 'math', 'question' => $first . ' + ' . $second . ' = ?'),
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    // Фон
    $bg = imagecolorallocate($image, 246, 247, 250);
    imagefilledrectangle($image, 0, 0, $width, $height, $bg);


    // Помехи: линии
    for ($i = 0; $i < 6; $i++) {

        $color = imagecolorallocate(
            $image,
            random_int(150, 215),
            random_int(150, 215),
            random_int(150, 215)
        );

        imageline(
            $image,
            random_int(0, $width),
            random_int(0, $height),
            random_int(0, $width),
            random_int(0, $height),
            $color
        );
    }

    // Помехи: точки
    for ($i = 0; $i < 1200; $i++) {

        $color = imagecolorallocate(
            $image,
            random_int(205, 255),
            random_int(205, 255),
            random_int(205, 255)
        );

        imagesetpixel(
            $image,
            random_int(0, $width),
            random_int(0, $height),
            $color
        );
    }


    /* ------------------------------------------
       Текст: каждый символ рисуем отдельно
       и растягиваем — так не нужен TTF-шрифт
       ------------------------------------------ */

    $tileW = 20;
    $tileH = 28;

    $glyphW = 30;
    $glyphH = 42;

    imagealphablending($image, true);

    for ($i = 0; $i < strlen($code); $i++) {

        // Маленький холст для одного символа
        $tile = @imagecreatetruecolor($tileW, $tileH);

        if ($tile === false) {
            continue;
        }

        $ink = imagecolorallocate($tile, 0, 0, 0);
        imagefilledrectangle($tile, 0, 0, $tileW, $tileH, $ink);

        $color = imagecolorallocate(
            $tile,
            random_int(20, 110),
            random_int(20, 110),
            random_int(70, 165)
        );

        // Шрифт 5 — встроенный, работает всегда
        imagestring($tile, 5, 2, 6, $code[$i], $color);

        // Растягиваем символ и ставим на место со сдвигом
        imagecopyresampled(
            $image,
            $tile,
            18 + $i * 42,
            random_int(12, 24),
            0,
            0,
            $glyphW,
            $glyphH,
            $tileW,
            $tileH
        );

        imagedestroy($tile);
    }


    header('Content-Type: image/png');

    imagepng($image);

    imagedestroy($image);

    exit;
}


/* ------------------------------------------
   JSON для формы: картинка или пример
   ------------------------------------------ */

if ($hasGD) {

    header('Content-Type: application/json; charset=utf-8');

    echo json_encode(
        array(
            'ok' => true,
            'type' => 'image',
            'url' => 'captcha.php?img=1&t=' . time(),
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


// Нет GD — отдаём пример вместо картинки
$first = random_int(2, 9);
$second = random_int(1, 9);

$_SESSION['captcha_answer'] = (string)($first + $second);
$_SESSION['captcha_time'] = time();
unset($_SESSION['captcha_code']);


header('Content-Type: application/json; charset=utf-8');

echo json_encode(
    array(
        'ok' => true,
        'type' => 'math',
        'question' => $first . ' + ' . $second . ' = ?',
    ),
    JSON_UNESCAPED_UNICODE
);