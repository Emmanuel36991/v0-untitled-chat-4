import { redirect } from 'next/navigation'

export default async function ImportPage() {
    redirect('/trades?action=import')
}
