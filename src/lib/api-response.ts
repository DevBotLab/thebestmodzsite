import { NextResponse } from 'next/server'

export function success<T = unknown>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function unauthorized(message = 'Не авторизован') {
  return NextResponse.json({ success: false, error: message }, { status: 401 })
}

export function forbidden(message = 'Доступ запрещён') {
  return NextResponse.json({ success: false, error: message }, { status: 403 })
}

export function notFound(message = 'Не найдено') {
  return NextResponse.json({ success: false, error: message }, { status: 404 })
}

export function validationError(errors: Record<string, string[]>) {
  return NextResponse.json({ success: false, error: 'Validation failed', errors }, { status: 422 })
}
