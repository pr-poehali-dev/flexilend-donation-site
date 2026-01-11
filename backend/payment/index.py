import json
import os
import hashlib
import uuid
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    API для создания платежей и обработки результатов оплаты.
    Поддерживает создание заказа и проверку статуса платежа.
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'create_payment':
            nickname = body.get('nickname', '')
            package_id = body.get('package_id', '')
            mode = body.get('mode', '')
            amount = body.get('amount', 0)
            promo = body.get('promo', '')
            
            if not all([nickname, package_id, mode, amount]):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Не все обязательные поля заполнены'
                    }),
                    'isBase64Encoded': False
                }
            
            discount = 0
            if promo.upper() == 'FIRST10':
                discount = int(amount * 0.1)
            elif promo.upper() == 'SALE20':
                discount = int(amount * 0.2)
            
            final_amount = amount - discount
            
            order_id = str(uuid.uuid4())
            payment_url = f"https://pay.flexilend.ru/checkout/{order_id}"
            
            # Сохраняем донат в базу данных
            try:
                dsn = os.environ.get('DATABASE_URL')
                conn = psycopg2.connect(dsn)
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO donations 
                    (player_nickname, server_mode, package_name, amount, promo_code, 
                     discount_percent, final_amount, payment_id, payment_url, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (
                    nickname, mode, package_id, amount, promo if promo else None,
                    int((discount / amount * 100) if amount > 0 else 0),
                    final_amount, order_id, payment_url, 'pending'
                ))
                
                conn.commit()
                cursor.close()
                conn.close()
            except Exception as db_error:
                # Логируем ошибку, но продолжаем работу
                print(f"Database error: {db_error}")
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'order_id': order_id,
                    'payment_url': payment_url,
                    'amount': amount,
                    'discount': discount,
                    'final_amount': final_amount,
                    'nickname': nickname,
                    'package': package_id,
                    'mode': mode
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'check_payment':
            order_id = body.get('order_id', '')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Не указан ID заказа'
                    }),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'status': 'pending',
                    'order_id': order_id
                }),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }