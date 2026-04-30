<?php

namespace Drupal\translator_custom\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TranslateController {

  public function translate(Request $request) {

    try {

      $data = json_decode($request->getContent(), TRUE);

      $texts = $data['texts'] ?? [];
      $lang  = $data['lang'] ?? '';

      if (empty($texts) || empty($lang)) {
        return new JsonResponse([
          "error" => "texts or lang missing"
        ], 400);
      }

      $apiUrl = "https://api.bharatgen.dev/v1/chat/completions";

      // ⚠️ API KEY (better move to env later)
      $apiKey = "bharatgen-iitb-token-wynmTmkZMNJbtYFfCoYMXmog3TQiaohxkCb2342sef";

      $prompt = "Translate into $lang ONLY. Do not explain.\n"
              . implode("\n", $texts);

      $payload = [
        "model" => "param",
        "temperature" => 0,
        "max_tokens" => 1024,
        "messages" => [
          [
            "role" => "system",
            "content" => "You are a strict translation engine. Output ONLY translated text."
          ],
          [
            "role" => "user",
            "content" => $prompt
          ]
        ]
      ];

      $ch = curl_init($apiUrl);

      curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
          "Content-Type: application/json",
          "Authorization: Bearer " . $apiKey
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE)
      ]);

      $result = curl_exec($ch);

      if (curl_errno($ch)) {
        return new JsonResponse([
          "error" => curl_error($ch)
        ], 500);
      }

      curl_close($ch);

      $json = json_decode($result, true);

      $translated = $json['choices'][0]['message']['content'] ?? '';

      // 🔥 IMPORTANT FIX: return clean UTF-8
      return new JsonResponse([
        "translations" => preg_split("/\r\n|\n|\r/", trim($translated))
      ], 200, [
        'Content-Type' => 'application/json; charset=UTF-8'
      ]);

    } catch (\Exception $e) {

      return new JsonResponse([
        "error" => $e->getMessage()
      ], 500);
    }
  }
}
