import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

// Carrega as variáveis de ambiente
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  try {
    // Configurações do usuário administrador padrão
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@contabilidadeigrejinha.com'
    const adminName = process.env.ADMIN_NAME || 'Administrador'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')


    // Verifica se o usuário administrador já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('⚠️  Usuário administrador já existe:', adminEmail)
      return
    }

    // Gera hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds)

    // Cria o usuário administrador
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',

      }
    })

    console.log('✅ Usuário administrador criado com sucesso:')
    console.log('📧 Email:', admin.email)
    console.log('👤 Nome:', admin.name)
    console.log('🔑 Role:', admin.role)
    console.log('🆔 ID:', admin.id)
    console.log('')
    console.log('🔐 Credenciais de acesso:')
    console.log('Email:', adminEmail)
    console.log('Senha:', adminPassword)
    console.log('')
    console.log('⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!')

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Conexão com banco de dados encerrada')
  })