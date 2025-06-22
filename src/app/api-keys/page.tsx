import { ApiKeyList } from "@/components/api-keys/ApiKeyList";
import { Center, Container, Stack, Title } from "@mantine/core";

export default function ApiKeysPage() {
  return (
    <Stack gap="md" p="md" pb="8rem">
      <Center>
        <Title>API Keys</Title>
      </Center>
      <Container size="md" px="md" w="100%">
        <ApiKeyList />
      </Container>
    </Stack>
  );
}
