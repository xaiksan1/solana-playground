import { FC } from "react";
import styled, { css } from "styled-components";

import Modal from "../../../../../components/Modal";
import { Warning } from "../../../../../components/Icons";
import { PgExplorer } from "../../../../../utils/pg";

interface DeleteItemProps {
  path: string;
}

export const DeleteItem: FC<DeleteItemProps> = ({ path }) => {
  const itemName = PgExplorer.getItemNameFromPath(path);

  const deleteItem = async () => {
    await PgExplorer.deleteItem(path);
  };

  return (
    <Modal
      title
      buttonProps={{
        text: "Delete",
        onSubmit: deleteItem,
        kind: "error",
      }}
    >
      <Content>
        <Icon>
          <Warning color="warning" />
        </Icon>
        <ContentText>
          <Main>Are you sure you want to delete '{itemName}'?</Main>
          <Desc>This action is irreversable.</Desc>
        </ContentText>
      </Content>
    </Modal>
  );
};

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0 0.25rem 0;
`;

const Icon = styled.div`
  width: 2rem;
  height: 2rem;

  & > svg {
    width: 100%;
    height: 100%;
  }
`;

const ContentText = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
`;

const Main = styled.span`
  font-weight: bold;
`;

const Desc = styled.span`
  ${({ theme }) => css`
    margin-top: 0.5rem;
    font-size: ${theme.font.code.size.small};
    color: ${theme.colors.default.textSecondary};
  `}
`;
