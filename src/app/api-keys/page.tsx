import { ApiKeyDocumentation } from "@/components/api-keys/ApiKeyDocumentation";
import { ApiKeyList } from "@/components/api-keys/ApiKeyList";
import { Container, Stack } from "@mantine/core";

export default function ApiKeysPage() {
  return (
    <Stack gap="md" p="md" pb="8rem">
      <Container size="md" px="md" w="100%">
        <Stack gap="lg">
          <ApiKeyDocumentation />
          <ApiKeyList />
        </Stack>
      </Container>
    </Stack>
  );
}
