from __future__ import annotations
from collections.abc import Iterable
from pydantic import BaseModel, ConfigDict, Field



class VocabularyEntry(BaseModel):
    model_config = ConfigDict(frozen=True)

    token: str = Field(min_length=1)
    token_id: int = Field(ge=0)


class Vocabulary(BaseModel):
    model_config = ConfigDict(validate_assignment=True)

    token_to_id_map: dict[str, int] = Field(default_factory=dict)
    id_to_token_map: dict[int, str] = Field(default_factory=dict)

    def add_token(self, token: str) -> int:
        if not token:
            raise ValueError("Token cannot be empty.")

        if token in self.token_to_id_map:
            return self.token_to_id_map[token]

        token_id = len(self.token_to_id_map)

        self.token_to_id_map[token] = token_id
        self.id_to_token_map[token_id] = token

        return token_id

    def add_tokens(self, tokens: Iterable[str]) -> None:
        for token in tokens:
            self.add_token(token)

    def get_id(self, token: str) -> int:
        try:
            return self.token_to_id_map[token]
        except KeyError as exc:
            raise KeyError(
                f"Token not found in vocabulary: {token!r}"
            ) from exc

    def get_token(self, token_id: int) -> str:

        try:
            return self.id_to_token_map[token_id]
        except KeyError as exc:
            raise KeyError(
                f"Token ID not found in vocabulary: {token_id}"
            ) from exc

    def contains_token(self, token: str) -> bool:
        return token in self.token_to_id_map

    def contains_id(self, token_id: int) -> bool:
        return token_id in self.id_to_token_map

    @property
    def size(self) -> int:
        return len(self.token_to_id_map)

    def tokens(self) -> list[str]:
        return list(self.token_to_id_map.keys())

    def ids(self) -> list[int]:
        return list(self.id_to_token_map.keys())

    def entries(self) -> list[VocabularyEntry]:
        return [
            VocabularyEntry(
                token=token,
                token_id=token_id,
            )
            for token, token_id in self.token_to_id_map.items()
        ]

    def __len__(self) -> int:
        return self.size

    def __contains__(self, token: str) -> bool:
        return self.contains_token(token)