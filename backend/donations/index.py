import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для проверки новых донатов StrictDonate плагином'''
    
    method = event.get('httpMethod', 'GET')
    
    # CORS для всех запросов
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}
    
    # Простая авторизация через API ключ
    api_key = event.get('headers', {}).get('X-Api-Key', '')
    expected_key = os.environ.get('DONATIONS_API_KEY', 'your-secret-key-here')
    
    if api_key != expected_key:
        return {
            'statusCode': 401,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    try:
        # Подключение к БД
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            # Получить неоплаченные донаты
            cursor.execute('''
                SELECT id, player_nickname, server_mode, package_name, 
                       final_amount, created_at
                FROM donations
                WHERE status = 'paid' AND issued = false
                ORDER BY created_at ASC
            ''')
            
            pending_donations = cursor.fetchall()
            
            # Конвертируем datetime в строку
            result = []
            for donation in pending_donations:
                result.append({
                    'id': donation['id'],
                    'player_nickname': donation['player_nickname'],
                    'server_mode': donation['server_mode'],
                    'package_name': donation['package_name'],
                    'amount': float(donation['final_amount']),
                    'created_at': donation['created_at'].isoformat()
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'donations': result})
            }
        
        elif method == 'POST':
            # Отметить донат как выданный
            body = json.loads(event.get('body', '{}'))
            donation_id = body.get('donation_id')
            
            if not donation_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'donation_id is required'})
                }
            
            cursor.execute('''
                UPDATE donations
                SET issued = true, issued_at = CURRENT_TIMESTAMP
                WHERE id = %s AND status = 'paid'
            ''', (donation_id,))
            
            conn.commit()
            affected = cursor.rowcount
            
            cursor.close()
            conn.close()
            
            if affected > 0:
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True, 'message': 'Donation marked as issued'})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Donation not found or already issued'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
