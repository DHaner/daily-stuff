import { Text } from '@/components/ui/text';
import { ScrollView, View } from 'react-native';

const SECTIONS = [
  {
    title: 'Tus datos se quedan en tu teléfono',
    body: 'Gastos, ingresos, categorías, tareas y entradas del diario se guardan en una base de datos local del dispositivo. La app no tiene cuenta ni servidor, y no envía esa información a ningún lugar.',
  },
  {
    title: 'Perfil',
    body: 'El nombre y el correo que escribes en Configuración se guardan solo en el dispositivo. No se usan para iniciar sesión ni para enviarte mensajes.',
  },
  {
    title: 'Fotos y archivos',
    body: 'La foto del diario y los archivos de las tareas se copian al almacenamiento privado de la app. Para elegirlos, la app te pide permiso de acceso a tus fotos y archivos.',
  },
  {
    title: 'Recordatorios',
    body: 'Los recordatorios de las tareas son notificaciones locales programadas en tu teléfono; no pasan por ningún servidor.',
  },
  {
    title: 'Borrar tus datos',
    body: 'Puedes eliminar registros uno por uno desde la app. Al desinstalarla, se borra todo lo que guardó en el dispositivo.',
  },
];

export default function PrivacyScreen() {
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 20 }}>
      {SECTIONS.map((section) => (
        <View key={section.title} className="gap-1.5">
          <Text className="text-base font-semibold">{section.title}</Text>
          <Text className="text-muted-foreground text-sm leading-6">{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
