<?php

namespace Drupal\translator_custom\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TranslateController {

  private function normalizeLang($lang) {

    $map = [
      "Hindi" => "Hindi",
      "Marathi" => "Marathi",
      "Bengali" => "Bengali",
      "Tamil" => "Tamil",
      "Telugu" => "Telugu",
      "Gujarati" => "Gujarati",
      "Punjabi" => "Punjabi",
      "Kannada" => "Kannada",
      "Malayalam" => "Malayalam",
      "Odia" => "Odia",
      "Assamese" => "Assamese",
      "Urdu" => "Urdu",

      // ⚠️ FIXED NAMES (IMPORTANT)
      "Dogri" => "Dogri language (India)",
      "Bodo" => "Bodo language (India)",
      "Santali" => "Santali language (India)",
      "Kashmiri" => "Kashmiri language",
      "Manipuri" => "Meitei (Manipuri) language",
      "Maithili" => "Maithili language",
      "Sindhi" => "Sindhi language",
      "Konkani" => "Konkani language",
      "Nepali" => "Nepali language"
    ];

    return $map[$lang] ?? $lang;
  }

  public function translate(Request $request) {

    $data = json_decode($request->getContent(), TRUE);

    $texts = $data['texts'] ?? [];
    $lang  = $data['lang'] ?? '';

    if (empty($texts) || empty($lang)) {
      return new JsonResponse(["error" => "missing input"], 400);
    }

    $apiKey = "bharatgen-iitb-token-wynmTmkZMNJbtYFfCoYMXmog3TQiaohxkCb2342sef";

    $targetLang = $this->normalizeLang($lang);

    // 🔥 STRONG PROMPT FOR LOW-RESOURCE LANGUAGES
    $prompt =
      "You are a professional translator.\n" .
      "Translate EVERY line into: $targetLang\n" .
      "Rules:\n" .
      "- Never use English\n" .
      "- Never skip lines\n" .
      "- Keep same order\n" .
      "- If language is rare (Dogri/Bodo/Odia), still translate or transliterate properly\n\n" .
      implode("\n", $texts);

    $payload = [
      "model" => "param",
      "temperature" => 0.1,
      "max_tokens" => 2000,
      "messages" => [
        [
          "role" => "system",
          "content" => "You are a multilingual Indian language expert translator."
        ],
        [
          "role" => "user",
          "content" => $prompt
        ]
      ]
    ];

    $ch = curl_init("https://api.bharatgen.dev/v1/chat/completions");

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      "Content-Type: application/json",
      "Authorization: Bearer " . $apiKey
    ]);

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $response = curl_exec($ch);
    curl_close($ch);

    $json = json_decode($response, true);

    $translated = $json['choices'][0]['message']['content'] ?? '';

    $lines = preg_split("/\r\n|\n|\r/", trim($translated));

    $result = [];
    foreach ($texts as $i => $t) {
      $result[$i] = $lines[$i] ?? $t;
    }

    return new JsonResponse([
      "translations" => $result
    ]);
  }
}
