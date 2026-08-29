import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';


export default function ModalScreen() {
  return (
    
      <Link href="/" dismissTo style={styles.link}>
        Go to home screen
      </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
