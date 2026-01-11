import json
import os
import hmac
import hashlib

def handler(event: dict, context) -> dict:
    '''Webhook endpoint для отправки уведомлений о донатах на Minecraft сервер'''
    
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'notify_server':
                # Получаем данные о донате
                player_nickname = body.get('player_nickname', '')
                server_mode = body.get('server_mode', '')
                package_name = body.get('package_name', '')
                webhook_url = body.get('webhook_url', '')
                secret_key = body.get('secret_key', '')
                
                if not all([player_nickname, server_mode, package_name, webhook_url]):
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Missing required fields'})
                    }
                
                # Формируем данные для отправки на сервер
                payload = {
                    'player': player_nickname,
                    'mode': server_mode,
                    'package': package_name,
                    'timestamp': context.request_id
                }
                
                # Подписываем данные
                if secret_key:
                    signature = hmac.new(
                        secret_key.encode(),
                        json.dumps(payload).encode(),
                        hashlib.sha256
                    ).hexdigest()
                    payload['signature'] = signature
                
                # Отправляем webhook на сервер Minecraft
                import urllib.request
                
                req = urllib.request.Request(
                    webhook_url,
                    data=json.dumps(payload).encode(),
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                
                try:
                    with urllib.request.urlopen(req, timeout=5) as response:
                        response_data = response.read().decode()
                        return {
                            'statusCode': 200,
                            'headers': cors_headers,
                            'body': json.dumps({
                                'success': True,
                                'message': 'Webhook sent successfully',
                                'server_response': response_data
                            })
                        }
                except Exception as webhook_error:
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({
                            'success': False,
                            'error': f'Failed to send webhook: {str(webhook_error)}'
                        })
                    }
            
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Unknown action'})
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': cors_headers,
        'body': json.dumps({'error': 'Method not allowed'})
    }
